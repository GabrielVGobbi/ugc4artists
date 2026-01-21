<?php

namespace App\Traits\Concerns\Models;

use Illuminate\Support\Arr;
use Illuminate\Database\Eloquent\Builder;
use Schema;

trait Searchable
{
    /**
     * Scope a query to search for a term in the attributes
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    protected function scopeFilter($query, $filter): Builder
    {
        $filter = collect($filter)->filter();

        //return $query->where(function (Builder $query) use ($filter) {
        foreach ($filter as $attribute => $valueTerm) {
            $searchTerms = $this->getSearchAttributes();
            $attribute = str_replace('_', '.', $attribute);
            $query->where(function (Builder $query) use ($attribute, $valueTerm, $searchTerms) {
                if (in_array($attribute, str_replace('_', '.', $searchTerms))) {
                    if (str_contains($attribute, '.')) {
                        [$relationName, $relationAttribute] = explode('.', $attribute);

                        $query->orWhereHas(
                            $relationName,
                            function (Builder $query) use ($relationAttribute, $valueTerm) {
                                if (gettype($valueTerm) == 'array') {
                                    $query->whereIn($relationAttribute, $valueTerm);
                                } else {
                                    $query->where($relationAttribute, 'LIKE', "%{$valueTerm}%");
                                }
                            }
                        );
                    } else {
                        $type = $this->getTypeColumn($attribute);
                        if ($type == 'json') {
                            foreach ($valueTerm as $val) {
                                $valueTerm = minusculo($val);
                                $query->orWhereRaw("JSON_SEARCH(genres, 'all', ?) IS NOT NULL", ["%{$valueTerm}%"]);
                            }
                        } else {
                            if (gettype($valueTerm) == 'array') {
                                $query->whereIn($attribute, $valueTerm);
                            } else {
                                $query->orWhere($attribute, 'LIKE', "%{$valueTerm}%");
                            }
                        }
                    }
                }

                if ($attribute == 'search') {
                    $query->where(
                        function ($query) use ($valueTerm) {
                            if ($valueTerm != '') {
                                $searchTerms = $this->getFillable();
                                foreach ($searchTerms as $searchColumn) {
                                    $query->Orwhere($searchColumn, 'LIKE', "%$valueTerm%");
                                }
                            }
                        }
                    );
                }

                if ($attribute == 'created.date.init' || $attribute == 'created.date.end') {
                    $query->where(
                        function ($query) use ($valueTerm, $attribute) {
                            $searchBy = $attribute == 'created.date.init' ? '>=' : '<=';
                            if (!empty($valueTerm)) {
                                $query->whereDate('created_at', $searchBy, _date_format($valueTerm, 'Y-m-d'));
                            }
                        }
                    );
                }
            });

            if ($attribute == 'month') {

                $query->where(
                    function ($query) use ($valueTerm) {
                        if (isset($valueTerm) && $valueTerm != '') {
                            if (gettype($valueTerm) == 'array') {
                                foreach ($valueTerm as $m) {
                                    if (!empty($m)) {
                                        $query->orWhereMonth('created_at', $m);
                                    }
                                }
                            } else {
                                $query->orWhereMonth('created_at', $valueTerm);
                            }
                        }
                    }
                );
            }

            if ($attribute == 'year') {
                $query->where(
                    function ($query) use ($valueTerm) {
                        if (isset($valueTerm) && $valueTerm != '') {
                            if (gettype($valueTerm) == 'array') {
                                foreach ($valueTerm as $y) {
                                    if (!empty($y)) {
                                        $query->orWhereYear('created_at', $y);
                                    }
                                }
                            } else {
                                $query->orWhereYear('created_at', $valueTerm);
                            }
                        }
                    }
                );
            }
        }

        return $query ?? null;
    }

    public function getSearchAttributes()
    {
        if (method_exists($this, 'searchable')) {
            return $this->searchable();
        }

        return property_exists($this, 'searchable') ? $this->searchable : $this->getFillable();
    }

    private function getTypeColumn($attribute)
    {
        $casts = $this->getCasts();

        if (array_key_exists($attribute, $casts)) {
            return $casts[$attribute];
        }
    }
}

//;

//foreach (collect($filter)->filter() as $attribute => $valueTerm) {
//    if (in_array($attribute, $this->getSearchAttributes())) {
//
//        $type = $this->getTypeColumn($attribute);
//
//        if ($type == 'json') {
//            return $query->whereJsonContains($attribute, $valueTerm);
//        }
//
//        if (gettype($valueTerm) == 'array') {
//            return $query->whereIn($attribute, $valueTerm);
//        } else {
//            return $query->where($attribute, $valueTerm);
//        }
//
//        return $query->where(function (Builder $query) use ($attributes, $searchTerm) {
//            foreach (Arr::wrap($attributes) as $attribute) {
//                $query->when(
//                    str_contains($attribute, '.'),
//
//                    function (Builder $query) use ($attribute, $searchTerm) {
//                        [$relationName, $relationAttribute] = explode('.', $attribute);
//                        $query->orWhereHas(
//                            $relationName,
//                            function (Builder $query) use ($relationAttribute, $searchTerm) {
//                                    $query->where($relationAttribute, 'LIKE', "%{$searchTerm}%");
//                                }
//                        );
//                    }
//                    ,
//                    function (Builder $query) use ($attribute, $searchTerm) {
//                        $query->orWhere($attribute, 'LIKE', "%{$searchTerm}%");
//                    }
//                );
//            }
//        });
//    }
//}
