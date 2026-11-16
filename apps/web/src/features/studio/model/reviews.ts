import type { CursorResponseOfReviewDto, ReviewDto } from '@detaileed/api-client';

export interface Review {
  id: string;
  /** "Anna N." */
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface ReviewPage {
  items: Review[];
  nextCursor: string | null;
}

export const REVIEWS_PAGE_SIZE = 10;

export const toReview = (dto: ReviewDto): Review => ({ ...dto, rating: Number(dto.rating) });

export const toReviewPage = (dto: CursorResponseOfReviewDto): ReviewPage => ({
  items: dto.items.map(toReview),
  nextCursor: dto.nextCursor,
});
