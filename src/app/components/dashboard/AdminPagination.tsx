import { Button } from '@/app/components/ui/button';

interface AdminPaginationProps {
  total: number;
  page: number;
  totalPages: number;
  summaryText?: string;
  previousLabel?: string;
  nextLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function AdminPagination({
  total,
  page,
  totalPages,
  summaryText,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  onPrevious,
  onNext,
}: AdminPaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{summaryText ?? `${total} result${total > 1 ? 's' : ''} - Page ${page} / ${totalPages}`}</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={onPrevious}>
          {previousLabel}
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
