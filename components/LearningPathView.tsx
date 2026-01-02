'use client';

import { LearningPath } from '@/lib/engines/knowledge-graph';
import { masteryColor, masteryBgColor, formatTime } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  path: LearningPath;
  userId: string;
}

export default function LearningPathView({ path, userId }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Estimated time: {formatTime(path.totalEstimatedTime)}
        </CardDescription>
        {path.gaps.length > 0 && (
          <Alert className="mt-2">
            <AlertDescription>
              ⚠️ {path.gaps.length} prerequisite gap(s) detected
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {path.concepts.map((concept, index) => (
            <Link
              key={concept.id}
              href={`/concept/${concept.id}`}
            >
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <h3 className="font-semibold text-foreground">{concept.title}</h3>
                      </div>
                      {concept.masteryScore !== undefined && (
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Mastery</span>
                            <span className={`font-medium ${masteryColor(concept.masteryScore)}`}>
                              {Math.round(concept.masteryScore * 100)}%
                            </span>
                          </div>
                          <Progress value={concept.masteryScore * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {path.concepts.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              No concepts available yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

