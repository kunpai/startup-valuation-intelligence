import { useState } from "react";
import { useValuation } from "@/context/ValuationContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  INDUSTRY_TAGS, 
  TECHNOLOGY_TAGS, 
  HARMONIC_FUNDING_STAGES, 
  CUSTOMER_TYPES, 
  REVENUE_MODELS, 
  TARGET_CUSTOMER_SIZES, 
  COUNTRIES
} from "@/lib/constants";
import { Building2, Loader2, X } from "lucide-react";

interface EditProfileDialogProps {
  trigger: React.ReactNode;
}

export function EditProfileDialog({ trigger }: EditProfileDialogProps) {
  const { companyProfile, financials, qualitative, saveFullProfile } = useValuation();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: companyProfile.name,
    description: companyProfile.description || "",
    foundedYear: companyProfile.foundedYear,
    stage: HARMONIC_FUNDING_STAGES.find(s => s.label === companyProfile.stage)?.value || "SEED",
    country: companyProfile.country || "United States",
    industryTags: companyProfile.industryTags || [],
    technologyTags: companyProfile.technologyTags || [],
    customerType: companyProfile.customerType || "",
    revenueModel: companyProfile.revenueModel || "",
    targetCustomerSize: companyProfile.targetCustomerSize || "",
    revenue: financials.revenue,
    growthRate: financials.growthRate,
    burnRate: financials.burnRate,
    cashBalance: financials.cashBalance,
    lastRoundValuation: financials.lastRoundValuation,
    teamScore: qualitative.team,
    productScore: qualitative.product,
    marketScore: qualitative.market
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData({
        name: companyProfile.name,
        description: companyProfile.description || "",
        foundedYear: companyProfile.foundedYear,
        stage: HARMONIC_FUNDING_STAGES.find(s => s.label === companyProfile.stage)?.value || "SEED",
        country: companyProfile.country || "United States",
        industryTags: companyProfile.industryTags || [],
        technologyTags: companyProfile.technologyTags || [],
        customerType: companyProfile.customerType || "",
        revenueModel: companyProfile.revenueModel || "",
        targetCustomerSize: companyProfile.targetCustomerSize || "",
        revenue: financials.revenue,
        growthRate: financials.growthRate,
        burnRate: financials.burnRate,
        cashBalance: financials.cashBalance,
        lastRoundValuation: financials.lastRoundValuation,
        teamScore: qualitative.team,
        productScore: qualitative.product,
        marketScore: qualitative.market
      });
    }
    setOpen(newOpen);
  };

  const toggleIndustryTag = (tag: string) => {
    if (formData.industryTags.includes(tag)) {
      setFormData({ ...formData, industryTags: formData.industryTags.filter(t => t !== tag) });
    } else if (formData.industryTags.length < 5) {
      setFormData({ ...formData, industryTags: [...formData.industryTags, tag] });
    }
  };

  const toggleTechnologyTag = (tag: string) => {
    if (formData.technologyTags.includes(tag)) {
      setFormData({ ...formData, technologyTags: formData.technologyTags.filter(t => t !== tag) });
    } else if (formData.technologyTags.length < 5) {
      setFormData({ ...formData, technologyTags: [...formData.technologyTags, tag] });
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    
    try {
      const stageLabel = HARMONIC_FUNDING_STAGES.find(s => s.value === formData.stage)?.label || "Seed";
      const countryData = COUNTRIES.find(c => c.value === formData.country);
      
      // Preserve existing sector if no industry tags selected
      const sector = formData.industryTags.length > 0 
        ? formData.industryTags[0] 
        : (companyProfile.sector || "Business Software Services");
      
      await saveFullProfile({
        profile: {
          name: formData.name.trim(),
          sector,
          stage: stageLabel,
          region: countryData?.region || "North America",
          foundedYear: formData.foundedYear,
          industryTags: formData.industryTags,
          technologyTags: formData.technologyTags,
          customerType: formData.customerType,
          revenueModel: formData.revenueModel,
          targetCustomerSize: formData.targetCustomerSize,
          country: formData.country,
          description: formData.description
        },
        financials: {
          revenue: formData.revenue,
          growthRate: formData.growthRate,
          burnRate: formData.burnRate,
          cashBalance: formData.cashBalance,
          lastRoundValuation: formData.lastRoundValuation
        },
        qualitative: {
          team: formData.teamScore,
          product: formData.productScore,
          market: formData.marketScore
        }
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Edit Company Profile
          </DialogTitle>
          <DialogDescription>
            Update your company information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basics" data-testid="tab-basics">Basics</TabsTrigger>
            <TabsTrigger value="business" data-testid="tab-business">Business Model</TabsTrigger>
            <TabsTrigger value="financials" data-testid="tab-financials">Financials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-company-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your company..."
                rows={3}
                data-testid="input-description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundedYear">Founded Year</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) || 2020 })}
                  data-testid="input-founded-year"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Funding Stage</Label>
                <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v })}>
                  <SelectTrigger data-testid="select-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HARMONIC_FUNDING_STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                <SelectTrigger data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>{country.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="business" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Industry Tags <span className="text-muted-foreground text-xs">(up to 5)</span></Label>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_TAGS.slice(0, 12).map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.industryTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleIndustryTag(tag)}
                    data-testid={`badge-industry-${tag}`}
                  >
                    {tag}
                    {formData.industryTags.includes(tag) && <X className="size-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Technology Tags <span className="text-muted-foreground text-xs">(up to 5)</span></Label>
              <div className="flex flex-wrap gap-2">
                {TECHNOLOGY_TAGS.slice(0, 12).map((tag) => (
                  <Badge
                    key={tag}
                    variant={formData.technologyTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTechnologyTag(tag)}
                    data-testid={`badge-tech-${tag}`}
                  >
                    {tag}
                    {formData.technologyTags.includes(tag) && <X className="size-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Select value={formData.customerType} onValueChange={(v) => setFormData({ ...formData, customerType: v })}>
                  <SelectTrigger data-testid="select-customer-type">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Revenue Model</Label>
                <Select value={formData.revenueModel} onValueChange={(v) => setFormData({ ...formData, revenueModel: v })}>
                  <SelectTrigger data-testid="select-revenue-model">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REVENUE_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Target Customer Size</Label>
              <Select value={formData.targetCustomerSize} onValueChange={(v) => setFormData({ ...formData, targetCustomerSize: v })}>
                <SelectTrigger data-testid="select-target-size">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_CUSTOMER_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="financials" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Annual Revenue ($)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({ ...formData, revenue: parseInt(e.target.value) || 0 })}
                  data-testid="input-revenue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="growthRate">Growth Rate (%)</Label>
                <Input
                  id="growthRate"
                  type="number"
                  value={formData.growthRate}
                  onChange={(e) => setFormData({ ...formData, growthRate: parseInt(e.target.value) || 0 })}
                  data-testid="input-growth-rate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="burnRate">Monthly Burn Rate ($)</Label>
                <Input
                  id="burnRate"
                  type="number"
                  value={formData.burnRate}
                  onChange={(e) => setFormData({ ...formData, burnRate: parseInt(e.target.value) || 0 })}
                  data-testid="input-burn-rate"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashBalance">Cash Balance ($)</Label>
                <Input
                  id="cashBalance"
                  type="number"
                  value={formData.cashBalance}
                  onChange={(e) => setFormData({ ...formData, cashBalance: parseInt(e.target.value) || 0 })}
                  data-testid="input-cash-balance"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastRoundValuation">Last Round Valuation ($)</Label>
              <Input
                id="lastRoundValuation"
                type="number"
                value={formData.lastRoundValuation}
                onChange={(e) => setFormData({ ...formData, lastRoundValuation: parseInt(e.target.value) || 0 })}
                data-testid="input-last-valuation"
              />
            </div>
            
            <div className="border-t pt-4 mt-4">
              <Label className="text-sm font-medium mb-3 block">Qualitative Scores</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamScore" className="text-xs text-muted-foreground">Team</Label>
                  <Input
                    id="teamScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.teamScore}
                    onChange={(e) => setFormData({ ...formData, teamScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    data-testid="input-team-score"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productScore" className="text-xs text-muted-foreground">Product</Label>
                  <Input
                    id="productScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.productScore}
                    onChange={(e) => setFormData({ ...formData, productScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    data-testid="input-product-score"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketScore" className="text-xs text-muted-foreground">Market</Label>
                  <Input
                    id="marketScore"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.marketScore}
                    onChange={(e) => setFormData({ ...formData, marketScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    data-testid="input-market-score"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.name.trim()} data-testid="button-save-profile">
            {isSaving ? (
              <>Saving... <Loader2 className="size-4 ml-2 animate-spin" /></>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
