import { AppointmentStatus } from '@prisma/client';

const FRONTEND_TO_PRISMA_STATUS: Record<string, AppointmentStatus> = {
  pending: AppointmentStatus.PENDING,
  confirmed: AppointmentStatus.CONFIRMED,
  cancelled: AppointmentStatus.CANCELLED,
  completed: AppointmentStatus.COMPLETED,
  'no-show': AppointmentStatus.NO_SHOW,
};

const PRISMA_TO_FRONTEND_STATUS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'pending',
  [AppointmentStatus.CONFIRMED]: 'confirmed',
  [AppointmentStatus.CANCELLED]: 'cancelled',
  [AppointmentStatus.COMPLETED]: 'completed',
  [AppointmentStatus.NO_SHOW]: 'no-show',
};

export const normalizeAppointmentStatusInput = (
  value: unknown
): string | undefined => {
  if (Array.isArray(value)) {
    return value.length > 0 ? normalizeAppointmentStatusInput(value[0]) : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed.toLowerCase() : undefined;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
};

export const parseAppointmentStatus = (
  value: unknown
): AppointmentStatus | undefined => {
  const normalized = normalizeAppointmentStatusInput(value);
  if (!normalized) {
    return undefined;
  }

  return FRONTEND_TO_PRISMA_STATUS[normalized];
};

export const formatAppointmentStatus = (status: AppointmentStatus): string => {
  return PRISMA_TO_FRONTEND_STATUS[status];
};

type AppointmentEntity = { status: AppointmentStatus } & Record<string, any>;

export const formatAppointmentForClient = <T extends AppointmentEntity>(
  appointment: T
) => ({
  ...appointment,
  status: formatAppointmentStatus(appointment.status),
});

export const formatAppointmentsForClient = <T extends AppointmentEntity>(
  appointments: T[]
) => appointments.map(formatAppointmentForClient);
