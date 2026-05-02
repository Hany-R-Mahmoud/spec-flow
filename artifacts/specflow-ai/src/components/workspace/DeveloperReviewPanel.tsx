import { useState } from 'react';
import { Story } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, Clock, XCircle, AlertTriangle, Shield, Maximize } from 'lucide-react';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { ReviewStatusBadge } from '@/components/shared/StatusBadge';
import { ReadinessScoreRing } from '@/components/shared/ReadinessScore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSessionStore } from '@/store/session-store';
import { ReviewStatus } from '@/lib/types';

interface DeveloperReviewPanelProps {
  stories: Story[];
  onComplete: () => void;
}

const REVIEWER_STATUSES: { value: ReviewStatus; label: string }[] = [
  { value: 'approved', label: 'Approved' },
  { value: 'needs-clarification', label: 'Needs Clarification' },
  { value: 'too-large', label: 'Too Large' },
  { value: 'technically-risky', label: 'Technically Risky' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'missing-ac', label: 'Missing Acceptance Criteria' },
];

export function DeveloperReviewPanel({ stories, onComplete }: DeveloperReviewPanelProps) {
  const { dispatch } = useSessionStore();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(stories[0]?.id || null);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('pending');
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [pmRevisionStatus, setPmRevisionStatus] = useState<'not-started' | 'in-progress' | 'resolved'>('not-started');

  const selectedStory = stories.find(s => s.id === selectedId);

  const approved = stories.filter(s => s.reviewStatus === 'approved').length;
  const needsClarification = stories.filter(s => s.reviewStatus === 'needs-clarification').length;
  const blocked = stories.filter(s => s.reviewStatus === 'blocked').length;
  const techRisk = stories.filter(s => s.reviewStatus === 'technically-risky').length;
  const avgReadiness = stories.length > 0
    ? Math.round(stories.reduce((sum, s) => sum + s.readinessScore.total, 0) / stories.length)
    : 0;

  const submitReview = () => {
    if (!selectedStory) return;
    const updated: Story = {
      ...selectedStory,
      reviewStatus,
      developerReview: {
        status: reviewStatus,
        comment,
        reviewerName: reviewerName || 'Developer',
        timestamp: new Date().toISOString(),
        pmRevisionStatus,
      }
    };
    dispatch({ type: 'UPDATE_STORY', payload: updated });
    toast({ title: 'Review submitted', description: `Review for ${selectedStory.id} saved.` });
    setComment('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Developer Review</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{stories.length} stories pending review</p>
        </div>
        <Button size="sm" onClick={onComplete} data-testid="button-complete-review">
          Complete Review
        </Button>
      </div>

      {/* Review Summary */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'Approved', count: approved, color: 'var(--color-success)', icon: CheckCircle },
          { label: 'Clarification', count: needsClarification, color: 'var(--color-warning)', icon: AlertTriangle },
          { label: 'Blocked', count: blocked, color: 'var(--color-danger)', icon: XCircle },
          { label: 'Tech Risk', count: techRisk, color: '#EA580C', icon: Shield },
          { label: 'Avg Readiness', count: avgReadiness, color: 'hsl(var(--primary))', icon: CheckCircle, suffix: '/100' },
        ].map(({ label, count, color, icon: Icon, suffix }) => (
          <div key={label} className="border border-border rounded-md p-2.5 bg-card text-center">
            <div className="text-xl font-bold" style={{ color }}>{count}{suffix}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Split view */}
      <div className="grid grid-cols-[280px_1fr] gap-4 h-[520px]">
        {/* Story list */}
        <div className="border border-border rounded-md overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-muted border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stories</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {stories.map(story => (
              <button
                key={story.id}
                onClick={() => {
                  setSelectedId(story.id);
                  setReviewStatus(story.reviewStatus !== 'pending' ? story.reviewStatus : 'pending');
                  setComment(story.developerReview?.comment || '');
                  setReviewerName(story.developerReview?.reviewerName || '');
                  setPmRevisionStatus(story.developerReview?.pmRevisionStatus || 'not-started');
                }}
                data-testid={`review-story-${story.id}`}
                className={cn(
                  'w-full text-left px-3 py-2.5 transition-colors',
                  selectedId === story.id ? 'bg-[var(--color-primary-soft)]' : 'hover:bg-muted'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{story.id}</span>
                  <PriorityBadge priority={story.priority} />
                </div>
                <div className="text-xs font-medium text-foreground truncate mb-1">{story.title}</div>
                <div className="flex items-center gap-2">
                  <ReviewStatusBadge status={story.reviewStatus} />
                  <ReadinessScoreRing score={story.readinessScore} size="sm" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Review detail */}
        <div className="border border-border rounded-md overflow-hidden flex flex-col">
          {selectedStory ? (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{selectedStory.id}</span>
                  <PriorityBadge priority={selectedStory.priority} />
                  <ReadinessScoreRing score={selectedStory.readinessScore} size="sm" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{selectedStory.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 italic">{selectedStory.userStory}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Review Status</label>
                  <Select value={reviewStatus} onValueChange={(v) => setReviewStatus(v as ReviewStatus)}>
                    <SelectTrigger className="h-8 text-xs" data-testid="select-review-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVIEWER_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Developer Comment</label>
                  <Textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add technical feedback, blockers, or clarification requests..."
                    className="text-xs min-h-[80px] resize-none"
                    data-testid="textarea-review-comment"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Reviewer Name</label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={e => setReviewerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      data-testid="input-reviewer-name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">PM Revision Status</label>
                    <Select value={pmRevisionStatus} onValueChange={(v) => setPmRevisionStatus(v as 'not-started' | 'in-progress' | 'resolved')}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started" className="text-xs">Not Started</SelectItem>
                        <SelectItem value="in-progress" className="text-xs">In Progress</SelectItem>
                        <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedStory.developerReview && (
                  <div className="bg-muted border border-border rounded-md p-3">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Previous Review</div>
                    <ReviewStatusBadge status={selectedStory.developerReview.status} />
                    <p className="text-xs text-foreground mt-1">{selectedStory.developerReview.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedStory.developerReview.reviewerName} · {new Date(selectedStory.developerReview.timestamp).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={submitReview}
                  data-testid="button-submit-review"
                >
                  Submit Review
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
              Select a story to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
