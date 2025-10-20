import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const QUICK_MODE_EFFICIENCY = 0.95; // 95% КПД для быстрого режима
const SPECIFIC_HEAT_CAPACITY_WATER = 4186; // Дж/(кг·°C)
const JOULES_PER_KWH = 3600000;

const InputField = ({ label, value, onChange, unit, placeholder }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <label className="text-gray-700 font-medium mb-1 sm:mb-0 w-full sm:w-auto flex-shrink-0">{label}:</label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder={placeholder}
                className="w-full sm:w-48 text-right p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                aria-label={label}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{unit}</span>
        </div>
    </div>
);

const ResultRow = ({ label, value, unit }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
        <span className="text-gray-600">{label}:</span>
        <span className="font-bold text-lg text-emerald-700">{value} <span className="text-sm font-normal text-gray-500">{unit}</span></span>
    </div>
);

const App = () => {
    const [volume, setVolume] = useState('1.5'); // литры
    const [initialTemp, setInitialTemp] = useState('15'); // °C
    const [finalTemp, setFinalTemp] = useState('100'); // °C
    const [tariff, setTariff] = useState('4.68'); // руб/кВт·ч
    const [mode, setMode] = useState('quick'); // 'quick' или 'precise'
    const [efficiency, setEfficiency] = useState('95'); // %
    const [result, setResult] = useState(null);

    const formatNumber = (num) => {
        if (isNaN(num) || !isFinite(num)) return '0,000';
        return num.toFixed(3).replace('.', ',');
    };
    
    const formatCurrency = (num) => {
        if (isNaN(num) || !isFinite(num)) return '0,00';
        return num.toFixed(2).replace('.', ',');
    };

    useEffect(() => {
        const calculateCosts = () => {
            const numVolume = parseFloat(volume.replace(',', '.')) || 0;
            const numInitialTemp = parseFloat(initialTemp.replace(',', '.')) || 0;
            const numFinalTemp = parseFloat(finalTemp.replace(',', '.')) || 0;
            const numTariff = parseFloat(tariff.replace(',', '.')) || 0;
            const numEfficiency = parseFloat(efficiency.replace(',', '.')) || 0;

            const currentEfficiencyPercent = mode === 'quick' ? QUICK_MODE_EFFICIENCY * 100 : numEfficiency;
            
            if (numVolume <= 0 || numFinalTemp <= numInitialTemp || numTariff < 0 || currentEfficiencyPercent <= 0 || currentEfficiencyPercent > 100) {
                setResult(null);
                return;
            }

            const mass = numVolume;
            const deltaT = numFinalTemp - numInitialTemp;

            const energyInJoules = mass * SPECIFIC_HEAT_CAPACITY_WATER * deltaT;
            const energyInKwh = energyInJoules / JOULES_PER_KWH;
            
            const heaterEfficiencyDecimal = currentEfficiencyPercent / 100;
            const consumedEnergyInKwh = energyInKwh / heaterEfficiencyDecimal;

            const cost = consumedEnergyInKwh * numTariff;

            setResult({
                energy: formatNumber(consumedEnergyInKwh),
                cost: formatCurrency(cost),
                efficiencyUsed: currentEfficiencyPercent,
            });
        };

        calculateCosts();
    }, [volume, initialTemp, finalTemp, tariff, mode, efficiency]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 font-sans">
            <main className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                        Калькулятор нагрева воды
                    </h1>
                    <p className="text-gray-500 mt-2">Рассчитайте затраты на кипячение воды</p>
                </header>

                <section className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">Данные для расчета</h2>
                    
                    <div className="flex justify-center items-center bg-gray-100 rounded-lg p-1 mb-6">
                        <button onClick={() => setMode('quick')} className={`px-4 py-2 w-1/2 rounded-md font-medium transition-all duration-300 ${mode === 'quick' ? 'bg-emerald-500 text-white shadow' : 'text-gray-600'}`}>
                            Быстрый
                        </button>
                        <button onClick={() => setMode('precise')} className={`px-4 py-2 w-1/2 rounded-md font-medium transition-all duration-300 ${mode === 'precise' ? 'bg-emerald-500 text-white shadow' : 'text-gray-600'}`}>
                            Точный
                        </button>
                    </div>

                    <InputField label="Объем воды" value={volume} onChange={setVolume} unit="л" placeholder="1.5" />
                    <InputField label="Начальная температура" value={initialTemp} onChange={setInitialTemp} unit="°C" placeholder="15" />
                    <InputField label="Конечная температура" value={finalTemp} onChange={setFinalTemp} unit="°C" placeholder="100" />
                    <InputField label="Тариф на электроэнергию" value={tariff} onChange={setTariff} unit="руб/кВт·ч" placeholder="4.68" />
                    
                    {mode === 'precise' && (
                        <div className="transition-all duration-500 ease-in-out">
                             <InputField label="КПД нагревателя" value={efficiency} onChange={setEfficiency} unit="%" placeholder="95" />
                        </div>
                    )}
                </section>
                
                {result ? (
                     <section>
                        <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-emerald-200 pb-2 mb-4">Результаты</h2>
                        <div className="bg-slate-50 p-4 rounded-lg">
                            <ResultRow label="Потребуется энергии" value={result.energy} unit="кВт·ч"/>
                            <ResultRow label="Стоимость нагрева" value={result.cost} unit="руб."/>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-4">
                            * Расчет произведен с учетом КПД нагревательного прибора в {result.efficiencyUsed}%.
                        </p>
                    </section>
                ) : (
                     <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">Введите корректные данные. Конечная температура должна быть выше начальной, а КПД от 1 до 100%.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);