<?php

namespace App\Supports\Helpers;

use Carbon\Carbon;

class DateHelper
{

    /**
     * Formata uma data recebida em diferentes formatos para YYYY-MM-DD
     *
     * @param string $dateString
     * @return string|null
     */
    public static function dateToFormat($dateString, $format = "Y-m-d")
    {
        return date_format(Carbon::parse(str_replace('/', '-', $dateString)), $format);
    }

    /**
     * Formata uma data recebida em diferentes formatos para YYYY-MM-DD
     *
     * @param string $dateString
     * @return string|null
     */
    public static function formatToDatabase($dateString)
    {
        try {
            $dateString = str_replace('/', '-', $dateString);

            // Tenta criar a data a partir do formato brasileiro (d/m/Y)
            $date = Carbon::createFromFormat('d/m/Y', $dateString);

            // Retorna no formato padrão do banco (YYYY-MM-DD)
            return $date->format('Y-m-d');
        } catch (\Exception $e) {
            // Se não conseguir, retorna null
            return null;
        }
    }

    /**
     * Verifica se a data é válida
     *
     * @param string $dateString
     * @param string $format
     * @return bool
     */
    public static function isValid($dateString, $format = 'd/m/Y')
    {
        $date = Carbon::createFromFormat($format, $dateString);
        return $date && $date->format($format) === $dateString;
    }
}
