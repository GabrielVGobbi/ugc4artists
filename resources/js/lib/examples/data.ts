// Tipo para pessoa
export type Person = {
    id: number;
    name: string;
    avatar: string; // caminho ou identificador da imagem
};

// 1. Retorna uma lista mock de pessoas
export function getAllPeople(): Person[] {
    return [
        { id: 1, name: "Erick", avatar: "erick.jpg" },
        { id: 2, name: "Nathalia Anjos", avatar: "nathalia_anjos.jpg" },
        { id: 3, name: "Mavi", avatar: "mavi.jpg" },
        { id: 4, name: "Duda", avatar: "duda.jpg" },
    ];
}

// 2. Gera URL de avatar com tamanho customizado
export function getAvatarUrl(filename: string, size: number = 64): string {
    return `/assets/landing_page/images/avatars/${filename}?w=${size}&h=${size}`;
}

// 3. Gera URL otimizada via ImageKit (ou outro CDN)
export function getImageKitUrl(path: string, options?: { w?: number; h?: number }): string {
    const baseUrl = "https://ik.imagekit.io/seu_projeto";
    const params = [];

    if (options?.w) params.push(`w=${options.w}`);
    if (options?.h) params.push(`h=${options.h}`);

    return `${baseUrl}${path}${params.length ? "?" + params.join("&") : ""}`;
}
