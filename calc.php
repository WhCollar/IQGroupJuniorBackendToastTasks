<?php

class TotalAmount {
    
    public float $sum;

    public function __construct(float $value) {
        $this->sum = $value;
    }
}

class StartDate
{
    public int $day;
    public int $month;
    public int $year;

    public function __construct(string $dateStr)
    {
        $dateList = explode('.', $dateStr);
        $this->day = $dateList[0];
        $this->month = $dateList[1];
        $this->year = $dateList[2];
    }

    public function addMonth(int $number)
    {
        $this->month = $this->month + $number;
        if ($this->month > 12) {
            $this->year = $this->year + intdiv($this->month, 12);
            $this->month = $this->month % 12;
        }
    }
}

class DepositData
{
    public StartDate $startDate;
    public int $sum;
    public int $term;
    public int $percent;
    public int $sumAdd;

    public function __construct(string $dataJSON)
    {
        $decodeData = json_decode($dataJSON);
        $this->startDate = new StartDate($decodeData->startDate);
        $this->sum = $decodeData->sum;
        $this->term = $decodeData->term;
        $this->percent = $decodeData->percent;
        $this->sumAdd = $decodeData->sumAdd;
    }
}

function calculateDepositAmount(DepositData $depositData):float
{
    $lastResault = $depositData->sum;
    $sumAdd = $depositData->sumAdd;
    $percent = $depositData->percent / 100;

    for ($i = 0; $i < $depositData->term; $i++) {
        $depositData->startDate->addMonth(1);
        $daysN = cal_days_in_month(CAL_GREGORIAN, $depositData->startDate->month, $depositData->startDate->year);
        $daysY = date('z', mktime(0, 0, 0, 12, 31, $depositData->startDate->year));
        $monthPerecent = $percent / $daysY * $daysN;
        $percentAmount = $lastResault * $monthPerecent;
        $sumN = $lastResault + $sumAdd + $percentAmount;
        $lastResault = $sumN;
    }

    return round($lastResault, 2, PHP_ROUND_HALF_DOWN);
}

$depositData = new DepositData(file_get_contents('php://input'));

$resault = new TotalAmount(calculateDepositAmount($depositData));

echo json_encode($resault);
