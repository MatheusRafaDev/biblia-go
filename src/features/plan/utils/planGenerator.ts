export interface BookChapterCount {
  bookId: string;
  totalChapters: number;
}

export interface PlanGenerationRequest {
  title: string;
  durationDays: number;
  books: BookChapterCount[];
}

export interface GeneratedPlanReading {
  bookId: string;
  chapter: number;
}

export interface GeneratedPlanDay {
  day: number;
  readings: GeneratedPlanReading[];
}

export interface GeneratedPlanResult {
  title: string;
  durationDays: number;
  totalChapters: number;
  chaptersPerDayAverage: number;
  days: GeneratedPlanDay[];
}

export function validatePlanRequest(request: PlanGenerationRequest): string | null {
  if (!request.title || request.title.trim().length < 3) {
    return 'Título deve ter pelo menos 3 caracteres.';
  }
  if (!request.durationDays || request.durationDays <= 0 || request.durationDays > 730) {
    return 'Duração deve estar entre 1 e 730 dias.';
  }
  if (!request.books || request.books.length === 0) {
    return 'Selecione ao menos um livro para o plano de leitura.';
  }
  return null;
}

export function generateCustomReadingPlan(request: PlanGenerationRequest): GeneratedPlanResult {
  const error = validatePlanRequest(request);
  if (error) {
    throw new Error(error);
  }

  // Flatten all chapters into an array of items
  const allReadings: GeneratedPlanReading[] = [];
  for (const book of request.books) {
    for (let c = 1; c <= book.totalChapters; c++) {
      allReadings.push({ bookId: book.bookId, chapter: c });
    }
  }

  const totalChapters = allReadings.length;
  const days: GeneratedPlanDay[] = [];
  const basePerDay = Math.floor(totalChapters / request.durationDays);
  const remainder = totalChapters % request.durationDays;

  let readIndex = 0;
  for (let day = 1; day <= request.durationDays; day++) {
    // Distribute remainder into the earliest days
    const take = basePerDay + (day <= remainder ? 1 : 0);
    const dayReadings = allReadings.slice(readIndex, readIndex + take);
    readIndex += take;

    days.push({
      day,
      readings: dayReadings,
    });
  }

  return {
    title: request.title.trim(),
    durationDays: request.durationDays,
    totalChapters,
    chaptersPerDayAverage: Math.round((totalChapters / request.durationDays) * 10) / 10,
    days,
  };
}
