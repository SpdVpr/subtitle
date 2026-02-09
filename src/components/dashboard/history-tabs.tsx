'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  TrendingUp, 
  History,
  CreditCard
} from 'lucide-react'
import { TranslationHistory } from './translation-history'
import { CreditHistory } from './credit-history'

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState('translations')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <History className="w-5 h-5 text-primary" />
              <span>Activity History</span>
            </CardTitle>
            <CardDescription>
              Track your translations and credit movements
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translations" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Translations</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>Credits</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="translations" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Translation History</span>
                </h3>
                <Badge variant="secondary" className="text-xs">
                  Recent Activity
                </Badge>
              </div>
              <div className="border rounded-lg">
                <TranslationHistory showHeader={false} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="credits" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Credit History</span>
                </h3>
                <Badge variant="secondary" className="text-xs">
                  All Transactions
                </Badge>
              </div>
              <div className="border rounded-lg">
                <CreditHistory showHeader={false} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
