import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Home, DollarSign, MapPin } from 'lucide-react';

interface PropertyFilterProps {
  onFilterChange: (filters: any) => void;
}

export const PropertyFilter: React.FC<PropertyFilterProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    transactionType: 'venda',
    propertyType: '',
    neighborhood: '',
    minPrice: '',
    maxPrice: '',
  });

  const handleChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Converte preços para número antes de enviar
    const numericFilters = {
      ...filters,
      minPrice: filters.minPrice ? parseFloat(filters.minPrice) * 100 : undefined, // Convertendo para centavos
      maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) * 100 : undefined, // Convertendo para centavos
    };
    onFilterChange(numericFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl mb-8 border border-gray-200">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        
        {/* Tipo de Transação */}
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Tipo</label>
          <Select 
            value={filters.transactionType} 
            onValueChange={(value) => handleChange('transactionType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Transação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Comprar</SelectItem>
              <SelectItem value="locacao">Alugar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Imóvel */}
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Imóvel</label>
          <Select 
            value={filters.propertyType} 
            onValueChange={(value) => handleChange('propertyType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo de Imóvel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="apartamento">Apartamento</SelectItem>
              <SelectItem value="casa">Casa</SelectItem>
              <SelectItem value="cobertura">Cobertura</SelectItem>
              <SelectItem value="terreno">Terreno</SelectItem>
              <SelectItem value="comercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bairro/Localização */}
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Localização</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Bairro ou Cidade" 
              className="pl-9"
              value={filters.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
            />
          </div>
        </div>

        {/* Preço Mínimo */}
        <div className="col-span-3 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Preço Mín.</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="number" 
              placeholder="Mínimo" 
              className="pl-9"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Preço Máximo */}
        <div className="col-span-3 md:col-span-1">
          <label className="text-sm font-medium text-gray-700">Preço Máx.</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              type="number" 
              placeholder="Máximo" 
              className="pl-9"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Botão de Busca */}
        <div className="col-span-6 md:col-span-1">
          <Button type="submit" className="w-full h-10">
            <Search className="w-5 h-5 mr-2" />
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
};
