import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lightbulb } from 'lucide-react';

export function SustainabilityTips() {
  const tips = [
    {
      title: 'Bike for short trips',
      description: 'Trips under 5km are perfect for cycling - it\'s often faster than driving in city traffic!'
    },
    {
      title: 'Combine errands',
      description: 'Plan multiple stops in one trip to reduce overall travel distance and emissions.'
    },
    {
      title: 'Off-peak travel',
      description: 'Traveling during off-peak hours can reduce congestion and improve public transport efficiency.'
    },
    {
      title: 'Walk when possible',
      description: 'Walking is zero-emission and great for your health. Perfect for trips under 2km.'
    },
    {
      title: 'Choose electric',
      description: 'E-bikes and electric public transport produce significantly lower emissions than cars.'
    }
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Sustainability Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{randomTip.title}</p>
        <p className="text-sm text-gray-600">{randomTip.description}</p>
      </CardContent>
    </Card>
  );
}
