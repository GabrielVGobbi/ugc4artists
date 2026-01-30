<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class UserService
{

    public function hasValidDocumentAndPhone(User $user): bool
    {
        return $user->hasValidDocumentAndPhone();
    }

    /**
     * Update user's document (CPF/CNPJ).
     */
    public function updateDocument(User $user, string $document): User
    {
        if (!empty($user->document)) {
            return $user;
        }

        $user->update(['document' => $document]);

        return $user;
    }

    public function updatePhone(User $user, string $phone): User
    {
        if (!empty($user->phone)) {
            return $user;
        }

        $user->update(['phone' => $phone]);

        return $user;
    }

    /**
     * Update user's document if not already set.
     */
    public function updateDocumentIfEmpty(User $user, string $document): User
    {
        if (empty($user->document)) {
            return $this->updateDocument($user, $document);
        }

        return $user;
    }
}
