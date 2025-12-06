import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface ReportDetailsDialogProps {
  report: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: () => void;
  onDismiss: () => void;
}

export const ReportDetailsDialog = ({
  report,
  open,
  onOpenChange,
  onResolve,
  onDismiss,
}: ReportDetailsDialogProps) => {
  if (!report) return null;

  const getReportType = () => {
    if (report.reported_user_id) return 'User';
    if (report.reported_listing_id) return 'Listing';
    if (report.reported_message_id) return 'Message';
    return 'Unknown';
  };

  const getTargetLink = () => {
    if (report.reported_listing_id) {
      return `/room/${report.reported_listing_id}`;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Report Details
            <Badge variant={
              report.status === 'pending' ? 'default' :
              report.status === 'resolved' ? 'outline' : 'destructive'
            }>
              {report.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Type</h3>
            <Badge>{getReportType()}</Badge>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Reporter</h3>
            <p className="text-sm">
              {report.reporter?.full_name || report.reporter?.email || 'Anonymous'}
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Reason</h3>
            <p className="text-sm">{report.reason}</p>
          </div>

          {report.description && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">Description</h3>
                <p className="text-sm whitespace-pre-wrap">{report.description}</p>
              </div>
            </>
          )}

          <Separator />

          {report.reported_listing && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Reported Listing
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-sm">{report.reported_listing.title}</p>
                {getTargetLink() && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={getTargetLink()!} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {report.reported_user && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Reported User
              </h3>
              <p className="text-sm">
                {report.reported_user.full_name || report.reported_user.email}
              </p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Created At
              </h3>
              <p className="text-sm">
                {format(new Date(report.created_at), 'MMM d, yyyy HH:mm')}
              </p>
            </div>

            {report.resolved_at && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Resolved At
                </h3>
                <p className="text-sm">
                  {format(new Date(report.resolved_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>

          {report.resolved_by_user && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                  Resolved By
                </h3>
                <p className="text-sm">{report.resolved_by_user.full_name}</p>
              </div>
            </>
          )}

          {report.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-2">
                <Button onClick={onResolve} className="flex-1">
                  Resolve Report
                </Button>
                <Button onClick={onDismiss} variant="destructive" className="flex-1">
                  Dismiss Report
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
