"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useSearchFilters } from "@/hooks/use-search"

interface SearchFilters {
  query?: string
  category?: string
  status?: string
  minReward?: number
  maxReward?: number
}

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const { filters, updateFilter, clearFilters, hasFilters } = useSearchFilters()
  
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    updateFilter(key, value)
    onFiltersChange?.({ ...filters, [key]: value })
  }
  
  const handleClearFilters = () => {
    clearFilters()
    onFiltersChange?.({})
  }
  
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search surveys..."
          value={filters.query || ''}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="market_research">Market Research</SelectItem>
            <SelectItem value="product_feedback">Product Feedback</SelectItem>
            <SelectItem value="customer_experience">Customer Experience</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min reward"
            value={filters.minReward || ''}
            onChange={(e) => handleFilterChange('minReward', parseInt(e.target.value) || undefined)}
            className="w-24"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max reward"
            value={filters.maxReward || ''}
            onChange={(e) => handleFilterChange('maxReward', parseInt(e.target.value) || undefined)}
            className="w-24"
          />
        </div>
        
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary">
              Search: {filters.query}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => handleFilterChange('query', '')}
              />
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary">
              Category: {filters.category}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => handleFilterChange('category', '')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary">
              Status: {filters.status}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => handleFilterChange('status', '')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
