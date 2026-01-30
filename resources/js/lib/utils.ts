import { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isSameUrl(
    url1: NonNullable<InertiaLinkProps['href']>,
    url2: NonNullable<InertiaLinkProps['href']>,
) {
    return resolveUrl(url1) === resolveUrl(url2);
}

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Formats a string as a Brazilian CPF (XXX.XXX.XXX-XX).
 * @param value Raw string input.
 * @returns The masked CPF string.
 */
export function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11); // keep only 11 digits

    return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{2})$/, '$1-$2');
}


/**
 * Formata um número de telefone brasileiro com DDD.
 * Exemplos:
 *  - (11) 98765-4321
 *  - (21) 2345-6789
 *
 * @param value Entrada bruta
 * @returns Telefone formatado
 */
export function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11); // até 11 dígitos

    if (numbers.length === 11) {
        // Celular (DDD + 9 dígitos)
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    if (numbers.length === 10) {
        // Fixo (DDD + 8 dígitos)
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Se ainda não completou, retorna parcial
    if (numbers.length > 2) {
        return numbers.replace(/(\d{2})(\d{0,5})(\d{0,4})/, '($1) $2-$3').trim();
    }

    return numbers;
}

export function formatPhoneFromDigits(digits: string): string {
    if (!digits) {
        return digits;
    }

    if (digits?.includes('*')) {
        return digits;
    }

    const d = digits.replace(/\D/g, '').slice(0, 11);

    const ddd = d.slice(0, 2);
    const rest = d.slice(2);

    if (d.length === 0) return '';
    if (d.length < 3) return `(${ddd}`; // "(" + 1 ou 2 dígitos do DDD

    // 10 ou 11 dígitos total
    if (d.length <= 10) {
        // fixo: rest até 8 dígitos => 4-4
        const p1 = rest.slice(0, 4);
        const p2 = rest.slice(4, 8);
        return `(${ddd}) ${p1}${p2 ? `-${p2}` : ''}`.trim();
    }

    // celular: rest 9 dígitos => 5-4
    const p1 = rest.slice(0, 5);
    const p2 = rest.slice(5, 9);
    return `(${ddd}) ${p1}${p2 ? `-${p2}` : ''}`.trim();
}

/**
 * Validates a Brazilian CPF number.
 * @param cpf CPF string (with or without mask).
 * @returns Object with isValid boolean and error message if invalid.
 */
export function validateCPF(cpf: string): { isValid: boolean; error?: string } {
    // Remove non-digits
    const numbers = cpf.replace(/\D/g, '');

    // Check if empty
    if (!numbers) {
        return { isValid: false, error: 'CPF é obrigatório' };
    }

    // Check length
    if (numbers.length !== 11) {
        return { isValid: false, error: 'CPF deve ter 11 dígitos' };
    }

    // Reject repeated digits (e.g., 111.111.111-11)
    if (/^(\d)\1{10}$/.test(numbers)) {
        return { isValid: false, error: 'CPF inválido' };
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) {
        return { isValid: false, error: 'CPF inválido' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) {
        return { isValid: false, error: 'CPF inválido' };
    }

    return { isValid: true };
}

/**
 * Checks if CPF input is complete (has 11 digits).
 */
export function isCPFComplete(cpf: string): boolean {
    return cpf.replace(/\D/g, '').length === 11;
}

export function formatCurrency(value: string | number, currency: string = 'BRL'): string {
    if (!value || value === 0) return 'R$ 0,00';

    let numValue = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;

    // Opcional: só divide se for um número inteiro muito grande (ex.: > 1 milhão e sem decimais)
    // if (Number.isInteger(numValue) && numValue > 1000000) numValue /= 100;

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency,
    }).format(numValue / 100);
}

/**
 * Formata número de cartão em blocos de 4 dígitos (XXXX XXXX XXXX XXXX).
 * @param value Entrada bruta
 * @returns Número formatado
 */
export function formatCardNumber(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 16); // até 16 dígitos

    return numbers
        .replace(/(\d{4})(?=\d)/g, '$1 ')
        .trim();
}

/**
 * Formata a data de validade do cartão em MM/YYYY
 * @param value Entrada bruta
 * @returns Data formatada
 */
export function formatCardDate(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 6); // até 6 dígitos (MMYYYY)

    if (numbers.length >= 3) {
        return numbers.replace(/(\d{2})(\d{0,4})/, '$1/$2');
    }

    return numbers;
}

export function isMaskedCPF(cpf: string) {
    return cpf ? cpf.includes('*') : false;
}
