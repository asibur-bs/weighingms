/** Training Dummy Printer JSON shapes. Not a vendor printer language. */

export interface TicketComponent {
  name: string;
  code: string;
  target: number;
  actual: number | null;
  unit: string;
}

export interface WeighingTicket {
  id: number;
  sessionId: string;
  title: string;
  batch: string;
  batchId: string;
  barcode: string;
  order: string;
  machine: string;
  shade: string;
  date: string;
  operator: string;
  components: TicketComponent[];
}
