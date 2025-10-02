import { Request, Response, NextFunction } from 'express';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
}

class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 1000; // Keep last 1000 requests

  public static addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }
  }

  public static getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public static getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.metrics.filter(m => m.endpoint === endpoint)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    const totalTime = filteredMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalTime / filteredMetrics.length;
  }

  public static getSlowestEndpoints(limit = 10): Array<{ endpoint: string; avgDuration: number }> {
    const endpointStats = new Map<string, { total: number; count: number }>();
    
    this.metrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      const existing = endpointStats.get(key) || { total: 0, count: 0 };
      endpointStats.set(key, {
        total: existing.total + metric.duration,
        count: existing.count + 1,
      });
    });
    
    return Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgDuration: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  public static clearMetrics(): void {
    this.metrics = [];
  }
}

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const endMemory = process.memoryUsage();

    // Calculate memory delta
    const memoryDelta: NodeJS.MemoryUsage = {
      rss: endMemory.rss - startMemory.rss,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      external: endMemory.external - startMemory.external,
      arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
    };

    // Store performance metric
    PerformanceMonitor.addMetric({
      endpoint: req.route?.path || req.path,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
      memoryUsage: memoryDelta,
    });

    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow request detected: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Memory monitoring middleware
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
  };

  // Log memory warnings
  if (memUsageMB.heapUsed > 500) { // 500MB threshold
    console.warn(`High memory usage detected: ${memUsageMB.heapUsed}MB heap used`);
  }

  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage', JSON.stringify(memUsageMB));
  }

  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout',
          message: `Request took longer than ${timeoutMs}ms`,
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      clearTimeout(timeout);
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Performance metrics endpoint
export const getPerformanceMetrics = (req: Request, res: Response) => {
  const metrics = PerformanceMonitor.getMetrics();
  const avgResponseTime = PerformanceMonitor.getAverageResponseTime();
  const slowestEndpoints = PerformanceMonitor.getSlowestEndpoints();

  res.json({
    success: true,
    data: {
      totalRequests: metrics.length,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      slowestEndpoints,
      recentMetrics: metrics.slice(-10), // Last 10 requests
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    },
  });
};

export { PerformanceMonitor };