export interface LibraryItem {
    id?: number;
    title: string;
    description: string;
    type: 'livro' | 'jogo' | 'filme';
    image: string | null;
    rating?: number;
}