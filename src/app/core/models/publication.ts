export interface Publication {
    id: number;
    date: string;
    content: string;
    image: string | null;
    editedAt?: string | null;
}