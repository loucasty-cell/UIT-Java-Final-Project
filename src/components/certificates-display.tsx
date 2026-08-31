import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, ExternalLink } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  issuer?: string;
  date: string;
  expiryDate?: string;
  verificationUrl?: string;
  imageUrl?: string;
}

interface CertificatesDisplayProps {
  certificates: Certificate[];
  onDownload?: (certId: string) => void;
}

function CertificateCard({ 
  certificate, 
  onDownload 
}: { 
  certificate: Certificate;
  onDownload?: (certId: string) => void;
}) {
  const issueDate = new Date(certificate.date);
  const formattedDate = issueDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isExpired = certificate.expiryDate 
    ? new Date(certificate.expiryDate) < new Date()
    : false;

  return (
    <Card className="overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition">
      {/* Certificate Header with gradient */}
      <div className="h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center">
        <Award className="w-16 h-16 text-white opacity-80" />
      </div>

      {/* Certificate Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-2">{certificate.title}</h3>
        
        {certificate.issuer && (
          <p className="text-sm text-muted-foreground mb-3">by {certificate.issuer}</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Issued</span>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>

          {certificate.expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Expires</span>
              <span className={`text-sm font-medium ${isExpired ? "text-red-600" : "text-green-600"}`}>
                {new Date(certificate.expiryDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {isExpired && (
          <Badge variant="destructive" className="mb-4 w-full justify-center">
            Expired
          </Badge>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onDownload && (
            <Button
              onClick={() => onDownload(certificate.id)}
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          )}

          {certificate.verificationUrl && (
            <Button
              onClick={() => window.open(certificate.verificationUrl, "_blank")}
              variant="outline"
              size="sm"
              className="flex-1 gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Verify
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * PHASE 6: Certificates Display Component
 * 
 * Shows:
 * - Achievement certificates
 * - Certificate titles
 * - Issue dates and expiry dates
 * - Certificate verification links
 * - Download functionality
 * - Grid layout for visual presentation
 */
export function CertificatesDisplay({
  certificates,
  onDownload,
}: CertificatesDisplayProps) {
  if (!certificates || certificates.length === 0) {
    return (
      <Card className="p-8 text-center rounded-lg border-0 shadow-sm">
        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No certificates earned yet</p>
      </Card>
    );
  }

  const activeCertificates = certificates.filter(
    (cert) => !cert.expiryDate || new Date(cert.expiryDate) >= new Date()
  );
  const expiredCertificates = certificates.filter(
    (cert) => cert.expiryDate && new Date(cert.expiryDate) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Active Certificates */}
      {activeCertificates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5" />
            <h2 className="text-lg font-bold">Active Certificates</h2>
            <Badge variant="secondary">{activeCertificates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCertificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onDownload={onDownload}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expired Certificates */}
      {expiredCertificates.length > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 opacity-50" />
            <h2 className="text-lg font-bold opacity-50">Expired Certificates</h2>
            <Badge variant="outline">{expiredCertificates.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
            {expiredCertificates.map((cert) => (
              <CertificateCard
                key={cert.id}
                certificate={cert}
                onDownload={onDownload}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
