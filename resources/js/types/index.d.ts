import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';
import { SvgName, SvgIconProps } from './svg';

export type SeoProps = {
    title: string;
    description: string;
    canonical: string;
    image: string;
};


export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    currentPath: string;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    document?: string | null;
    google_id?: string | null;
    avatar?: string | null;
    bio?: string | null;
    email_verified_at: string | null;
    onboarding_completed_at?: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface UserAuth<T = unknown> {
    id: number;
    name: string;
    email: string;
    phone: string;
    document: string;
    google_id?: string | null;
    avatar?: string | null;
    email_verified_at: string | null;
    onboarding_completed_at?: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    extra?: T;
}

export interface OnboardingProgress {
    current_step: number;
    data: OnboardingData;
    updated_at?: string;
    completed?: boolean;
}

export interface OnboardingData {
    role: 'artist' | 'creator' | 'brand' | '';
    source: string;
    display_name: string;
    country: string;
    state: string;
    city: string;
    primary_language: string;
    expectation: string;
    links: Array<{ type: string; url: string }>;
    // Artist fields
    artist_type?: string;
    primary_genre?: string;
    subgenres?: string[];
    career_stage?: string;
    released_tracks_count?: string;
    release_frequency?: string;
    next_release_window?: string;
    release_type?: string;
    release_stage?: string;
    has_cover_art?: boolean;
    has_release_date?: boolean;
    release_date?: string;
    platforms?: string[];
    audience_range?: string;
    primary_goal?: string;
    open_to?: string[];
    monetization_status?: string;
    // Creator fields
    primary_handle?: string;
    creator_type?: string;
    niches?: string[];
    audience_gender?: string;
    audience_age_range?: string[];
    followers_range?: string;
    engagement_self_assessment?: string;
    content_formats?: string[];
    content_style?: string[];
    on_camera_presence?: string;
    production_resources?: string[];
    brand_experience_level?: string;
    work_models?: string[];
    monthly_capacity?: string;
    disallowed_categories?: string[];
    exclusivity_preference?: string;
    preferred_brands_text?: string;
    // Brand fields
    company_name?: string;
    brand_name?: string;
    industry?: string;
    company_size?: string;
    website?: string;
    contact_name?: string;
    contact_role?: string;
    contact_email?: string;
    contact_phone?: string;
    team_size_marketing?: string;
    primary_objective?: string;
    kpi_focus?: string[];
    campaign_timeline?: string;
    creator_types?: string[];
    platform_targets?: string[];
    target_niches?: string[];
    creator_location_preference?: string;
    monthly_budget_range?: string;
    campaigns_per_month?: string;
    typical_deliverables?: string[];
    needs?: string[];
    approval_flow?: string;
    disallowed_creator_categories?: string[];
    brand_guidelines_url?: string;
}

export interface PaginationMeta {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
    path: string
}

export interface PaginationLinks {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
    links: PaginationLinks
}

declare global {
    interface Window {
        axios: import('axios').AxiosInstance;
    }
}
