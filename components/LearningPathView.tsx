'use client';

import { LearningPath } from '@/lib/engines/knowledge-graph';
import { masteryColor, masteryBgColor, formatTime } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  path: LearningPath;
  userId: string;
}

export default function LearningPathView({ path, userId }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Estimated time: {formatTime(path.totalEstimatedTime)}
        </p>
        {path.gaps.length > 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            ⚠️ {path.gaps.length} prerequisite gap(s) detected
          </p>
        )}
      </div>

      <div className="space-y-3">
        {path.concepts.map((concept, index) => (
          <Link
            key={concept.id}
            href={`/concept/${concept.id}`}
            className="block p-4 border rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    {index + 1}.
                  </span>
                  <h3 className="font-semibold">{concept.title}</h3>
                </div>
                {concept.masteryScore !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${masteryBgColor(concept.masteryScore)}`}
                          style={{ width: `${concept.masteryScore * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${masteryColor(concept.masteryScore)}`}>
                        {Math.round(concept.masteryScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}

        {path.concepts.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No concepts available yet.
          </p>
        )}
      </div>
    </div>
  );
}

