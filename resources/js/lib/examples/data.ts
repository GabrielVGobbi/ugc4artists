// Tipo para pessoa
export type Person = {
    id: number;
    name: string;
    avatar: string; // caminho ou identificador da imagem
};

// 1. Retorna uma lista mock de pessoas
export function getAllPeople(): Person[] {
    return [
        { id: 1, name: "Alice", avatar: "alice.png" },
        { id: 2, name: "Bruno", avatar: "bruno.png" },
        { id: 3, name: "Carla", avatar: "carla.png" },
        { id: 4, name: "Diego", avatar: "diego.png" },
        { id: 5, name: "Fernanda", avatar: "fernanda.png" },
        { id: 6, name: "Gabriel", avatar: "gabriel.png" },
    ];
}

// 2. Gera URL de avatar com tamanho customizado
export function getAvatarUrl(filename: string, size: number = 64): string {
    return `/assets/avatars/${filename}?w=${size}&h=${size}`;
}

// 3. Gera URL otimizada via ImageKit (ou outro CDN)
export function getImageKitUrl(path: string, options?: { w?: number; h?: number }): string {
    const baseUrl = "https://ik.imagekit.io/seu_projeto"; // substitua pelo seu endpoint do ImageKit
    const params = [];

    if (options?.w) params.push(`w=${options.w}`);
    if (options?.h) params.push(`h=${options.h}`);

    return `${baseUrl}${path}${params.length ? "?" + params.join("&") : ""}`;
}
