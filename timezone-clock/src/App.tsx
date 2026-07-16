import { useEffect, useState } from 'react';

interface TimeZoneClock {
  name: string;
  timezone: string;
  offset: number;
}

const TIME_ZONES: TimeZoneClock[] = [
  { name: 'New York', timezone: 'America/New_York', offset: -5 },
  { name: 'London', timezone: 'Europe/London', offset: 0 },
  { name: 'Paris', timezone: 'Europe/Paris', offset: 1 },
  { name: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9 },
  { name: 'Sydney', timezone: 'Australia/Sydney', offset: 11 },
  { name: 'Dubai', timezone: 'Asia/Dubai', offset: 4 },
];

export default function TimeZoneClock() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};

      TIME_ZONES.forEach((tz) => {
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        const tzTime = new Date(utcTime + tz.offset * 3600000);

        newTimes[tz.timezone] = tzTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      });

      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">World Clock</h1>
          <p className="text-slate-400">Current time across multiple time zones</p>
        </div>

        {/* Clock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TIME_ZONES.map((tz) => (
            <div
              key={tz.timezone}
              className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-600"
            >
              {/* City Name */}
              <h2 className="text-2xl font-bold text-white mb-2">{tz.name}</h2>

              {/* Timezone Offset */}
              <p className="text-sm text-slate-400 mb-4">
                UTC {tz.offset >= 0 ? '+' : ''}{tz.offset}
              </p>

              {/* Digital Clock */}
              <div className="bg-black rounded-lg p-6 text-center font-mono">
                <div className="text-4xl font-bold text-cyan-400 tracking-widest">
                  {times[tz.timezone] || '00:00:00'}
                </div>
              </div>

              {/* Analog Clock */}
              <div className="mt-6 flex justify-center">
                <AnalogClock timezone={tz.timezone} offset={tz.offset} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400">
          <p>Updates every second</p>
        </div>
      </div>
    </div>
  );
}

function AnalogClock({ timezone, offset }: { timezone: string; offset: number }) {
  const [rotation, setRotation] = useState({ hour: 0, minute: 0, second: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const tzTime = new Date(utcTime + offset * 3600000);

      const hours = tzTime.getHours() % 12;
      const minutes = tzTime.getMinutes();
      const seconds = tzTime.getSeconds();

      setRotation({
        hour: hours * 30 + minutes * 0.5,
        minute: minutes * 6 + seconds * 0.1,
        second: seconds * 6,
      });
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, [offset]);

  return (
    <div className="relative w-24 h-24 bg-slate-900 rounded-full border-4 border-slate-600 shadow-lg">
      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

      {/* Hour hand */}
      <div
        className="absolute top-1/2 left-1/2 w-1 h-6 bg-slate-300 rounded-full transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-500"
        style={{
          transform: `translate(-50%, -100%) rotate(${rotation.hour}deg)`,
        }}
      ></div>

      {/* Minute hand */}
      <div
        className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-slate-400 rounded-full transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-500"
        style={{
          transform: `translate(-50%, -100%) rotate(${rotation.minute}deg)`,
        }}
      ></div>

      {/* Second hand */}
      <div
        className="absolute top-1/2 left-1/2 w-0.5 h-9 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-full origin-bottom transition-transform duration-500"
        style={{
          transform: `translate(-50%, -100%) rotate(${rotation.second}deg)`,
        }}
      ></div>

      {/* Hour markers */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-2 bg-slate-500 transform"
          style={{
            left: '50%',
            top: '2px',
            marginLeft: '-2px',
            transform: `rotate(${i * 30}deg) translateY(0)`,
            transformOrigin: '0 46px',
          }}
        ></div>
      ))}
    </div>
  );
}
