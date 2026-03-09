import { Router, Response, NextFunction } from 'express';
import { ExtendedRequest } from '../types';

const router = Router();

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'xlsx' | 'image' | 'other';
  fileSize: number;
  dealId?: string;
  documentType:
    | 'contract'
    | 'proposal'
    | 'invoice'
    | 'quote'
    | 'specification'
    | 'report'
    | 'other';
  status: 'draft' | 'under-review' | 'approved' | 'archived';
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
  tenantId: string;
  url?: string;
}

// Mock data store per tenant
const documentsStore: Record<string, Document[]> = {
  greenput: [
    {
      id: 'doc-1',
      title: 'Enterprise Software Proposal',
      fileName: 'Acme_Software_Proposal_2024.pdf',
      fileType: 'pdf',
      fileSize: 2150000,
      dealId: 'deal-1',
      documentType: 'proposal',
      status: 'approved',
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      tenantId: 'greenput',
      url: '/documents/doc-1/download',
    },
    {
      id: 'doc-2',
      title: 'Consulting Services Contract',
      fileName: 'TechVision_Consulting_Contract.docx',
      fileType: 'docx',
      fileSize: 450000,
      dealId: 'deal-2',
      documentType: 'contract',
      status: 'under-review',
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: 'greenput',
      url: '/documents/doc-2/download',
    },
    {
      id: 'doc-3',
      title: 'Cloud Migration Requirements',
      fileName: 'GlobalFinance_Requirements_v3.xlsx',
      fileType: 'xlsx',
      fileSize: 890000,
      dealId: 'deal-3',
      documentType: 'specification',
      status: 'draft',
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      tenantId: 'greenput',
      url: '/documents/doc-3/download',
    },
    {
      id: 'doc-4',
      title: 'Innovate Labs - Implementation Report',
      fileName: 'Innovate_Labs_Implementation_Report.pdf',
      fileType: 'pdf',
      fileSize: 3200000,
      dealId: 'deal-4',
      documentType: 'report',
      status: 'approved',
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      tenantId: 'greenput',
      url: '/documents/doc-4/download',
    },
    {
      id: 'doc-5',
      title: 'SaaS Platform Invoice',
      fileName: 'SaaS_Invoice_2024_March.pdf',
      fileType: 'pdf',
      fileSize: 520000,
      dealId: 'deal-4',
      documentType: 'invoice',
      status: 'approved',
      uploadedBy: 'user-1',
      uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tenantId: 'greenput',
      url: '/documents/doc-5/download',
    },
  ],
};

// Middleware to require authentication
function requireAuth(req: ExtendedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

// GET /api/documents - list documents (filterable by dealId)
router.get('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  let documents = documentsStore[tenantId] || [];

  // Apply dealId filter if provided
  const dealId = req.query['dealId'] as string | undefined;
  if (dealId) {
    documents = documents.filter((d) => d.dealId === dealId);
  }

  // Apply status filter if provided
  const status = req.query['status'] as string | undefined;
  if (status) {
    documents = documents.filter((d) => d.status === status);
  }

  res.json({
    data: documents,
    total: documents.length,
    tenantId,
  });
});

// GET /api/documents/:id - get document
router.get('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const documentId = req.params['id'];

  const documents = documentsStore[tenantId] || [];
  const document = documents.find((d) => d.id === documentId && d.tenantId === tenantId);

  if (!document) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  res.json(document);
});

// POST /api/documents - upload document metadata
router.post('/', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const {
    title,
    fileName,
    fileType = 'other',
    fileSize,
    dealId,
    documentType = 'other',
  } = req.body;

  if (!title || !fileName || fileSize === undefined) {
    res.status(400).json({ error: 'title, fileName, and fileSize are required' });
    return;
  }

  const validFileTypes = ['pdf', 'docx', 'xlsx', 'image', 'other'];
  if (!validFileTypes.includes(fileType)) {
    res.status(400).json({ error: 'Invalid file type' });
    return;
  }

  const validDocumentTypes = [
    'contract',
    'proposal',
    'invoice',
    'quote',
    'specification',
    'report',
    'other',
  ];
  if (!validDocumentTypes.includes(documentType)) {
    res.status(400).json({ error: 'Invalid document type' });
    return;
  }

  const newDocument: Document = {
    id: `doc-${Date.now()}`,
    title,
    fileName,
    fileType,
    fileSize,
    dealId,
    documentType,
    status: 'draft',
    uploadedBy: req.user?.sub || 'unknown',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tenantId,
    url: `/documents/${`doc-${Date.now()}`}/download`,
  };

  if (!documentsStore[tenantId]) {
    documentsStore[tenantId] = [];
  }

  documentsStore[tenantId].push(newDocument);

  res.status(201).json(newDocument);
});

// PATCH /api/documents/:id - update status
router.patch('/:id', requireAuth, (req: ExtendedRequest, res: Response) => {
  const tenantId = req.tenant?.id || 'greenput';
  const documentId = req.params['id'];
  const { status, title } = req.body;

  const documents = documentsStore[tenantId] || [];
  const docIndex = documents.findIndex(
    (d) => d.id === documentId && d.tenantId === tenantId
  );

  if (docIndex === -1) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const document = documents[docIndex];

  // Validate status if provided
  const validStatuses = ['draft', 'under-review', 'approved', 'archived'];
  if (status && !validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }

  if (status) {
    document.status = status;
  }
  if (title !== undefined) {
    document.title = title;
  }
  document.updatedAt = new Date().toISOString();

  res.json(document);
});

export default router;
