import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Home, Bed, Bath, Car, DollarSign, MapPin } from 'lucide-react';

// Assumindo que o tipo Property é importado do shared/types ou gerado pelo tRPC
interface Property {
  id: number;
  title: string;
  description: string;
  transactionType: 'venda' | 'locacao';
  propertyType: string;
  neighborhood: string;
  city: string;
  salePrice: number; // em centavos
  rentalPrice: number; // em centavos
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  totalArea: number;
  mainImageUrl: string;
  referenceCode: string;
}

interface PropertyCardProps {
  property: Property;
}

const formatCurrency = (valueInCents: number, type: 'sale' | 'rental') => {
  if (!valueInCents) return 'Sob Consulta';
  const value = valueInCents / 100;
  const prefix = type === 'sale' ? 'R$' : 'R$ /mês';
  return `${prefix} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const price = property.transactionType === 'venda' 
    ? formatCurrency(property.salePrice, 'sale') 
    : formatCurrency(property.rentalPrice, 'rental');

  return (
    <Card className="w-full max-w-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="relative h-48">
        <img 
          src={property.mainImageUrl || 'https://via.placeholder.com/400x300?text=Casa+DF'} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          {property.transactionType === 'venda' ? 'Venda' : 'Aluguel'}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg truncate">{property.title}</CardTitle>
        <p className="text-sm text-muted-foreground flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-primary" />
          {property.neighborhood}, {property.city}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
            {price}
          </div>
          <div className="text-xs text-muted-foreground">
            Ref: {property.referenceCode}
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
          <div className="flex items-center" title="Área Total">
            <Home className="w-4 h-4 mr-1" />
            {property.totalArea} m²
          </div>
          <div className="flex items-center" title="Quartos">
            <Bed className="w-4 h-4 mr-1" />
            {property.bedrooms}
          </div>
          <div className="flex items-center" title="Banheiros">
            <Bath className="w-4 h-4 mr-1" />
            {property.bathrooms}
          </div>
          <div className="flex items-center" title="Vagas">
            <Car className="w-4 h-4 mr-1" />
            {property.parkingSpaces}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline" asChild>
          <a href={`/imovel/${property.id}`}>Ver Detalhes</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
