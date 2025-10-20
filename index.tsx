import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// Вспомогательный компонент для полей ввода для лучшей структуры и стиля
const InputField = ({ label, value, onChange, unit, placeholder }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <label className="text-gray-700 font-medium mb-1 sm:mb-0 w-full sm:w-auto">{label}:</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder={placeholder}
                className="w-full sm:w-48 text-right p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                aria-label={label}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{unit}</span>
        </div>
    </div>
);

// Вспомогательный компонент для отображения результатов
const ResultRow = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
        <span className="text-gray-600">{label}:</span>
        <span className="font-bold text-lg text-indigo-700">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></span>
    </div>
);


const App = () => {
    const [power, setPower] = useState('1500'); // в ваттах
    const [hoursPerDay, setHoursPerDay] = useState('2');
    const [daysPerMonth, setDaysPerMonth] = useState('30');
    const [tariff, setTariff] = useState('4.68');
    const [results, setResults] = useState(null);

    const formatNumber = (num) => {
        if (isNaN(num) || !isFinite(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
    };
    
    useEffect(() => {
        const calculateCosts = () => {
            const numPower = parseFloat(power.replace(',', '.')) || 0;
            const numHours = parseFloat(hoursPerDay.replace(',', '.')) || 0;
            const numDays = parseFloat(daysPerMonth.replace(',', '.')) || 0;
            const numTariff = parseFloat(tariff.replace(',', '.')) || 0;

            if (numPower <= 0 || numHours < 0 || numTariff <= 0) {
                setResults(null);
                return;
            }

            const powerInKW = numPower / 1000;

            const dailyConsumption = powerInKW * numHours;
            const weeklyConsumption = dailyConsumption * 7;
            const monthlyConsumption = dailyConsumption * numDays;
            const yearlyConsumption = dailyConsumption * 365;

            const dailyCost = dailyConsumption * numTariff;
            const weeklyCost = weeklyConsumption * numTariff;
            const monthlyCost = monthlyConsumption * numTariff;
            const yearlyCost = yearlyConsumption * numTariff;

            setResults({
                daily: { cost: formatNumber(dailyCost), consumption: formatNumber(dailyConsumption) },
                weekly: { cost: formatNumber(weeklyCost), consumption: formatNumber(weeklyConsumption) },
                monthly: { cost: formatNumber(monthlyCost), consumption: formatNumber(monthlyConsumption) },
                yearly: { cost: formatNumber(yearlyCost), consumption: formatNumber(yearlyConsumption) },
            });
        };

        calculateCosts();
    }, [power, hoursPerDay, daysPerMonth, tariff]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-gray-200 font-sans">
            <main className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        Калькулятор стоимости электроэнергии
                    </h1>
                    <p className="text-gray-500 mt-2">Рассчитайте расходы на ваши электроприборы</p>
                </header>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Данные для расчета</h2>
                    <InputField label="Мощность прибора" value={power} onChange={setPower} unit="Вт" placeholder="1500" />
                    <InputField label="Время работы в день" value={hoursPerDay} onChange={setHoursPerDay} unit="часов" placeholder="2" />
                    <InputField label="Дней работы в месяц" value={daysPerMonth} onChange={setDaysPerMonth} unit="дней" placeholder="30" />
                    <InputField label="Тариф" value={tariff} onChange={setTariff} unit="руб/кВт·ч" placeholder="4.68" />
                </section>
                
                {results ? (
                     <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-indigo-200 pb-2 mb-4">Результаты</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-center text-gray-600 mb-3">Расходы</h3>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <ResultRow label="В день" value={results.daily.cost} unit="руб."/>
                                    <ResultRow label="В неделю" value={results.weekly.cost} unit="руб."/>
                                    <ResultRow label="В месяц" value={results.monthly.cost} unit="руб."/>
                                    <ResultRow label="В год" value={results.yearly.cost} unit="руб."/>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-center text-gray-600 mb-3">Потребление</h3>
                                 <div className="bg-slate-50 p-4 rounded-lg">
                                    <ResultRow label="В день" value={results.daily.consumption} unit="кВт·ч"/>
                                    <ResultRow label="В неделю" value={results.weekly.consumption} unit="кВт·ч"/>
                                    <ResultRow label="В месяц" value={results.monthly.consumption} unit="кВт·ч"/>
                                    <ResultRow label="В год" value={results.yearly.consumption} unit="кВт·ч"/>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                     <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">Введите корректные данные для расчета.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);