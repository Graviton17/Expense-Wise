"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Trash, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// (Interfaces remain the same)
export interface ApprovalRule {
  id: string; name: string; description: string;
  approvers: { id: string; name: string }[]; isManagerApprovalRequired: boolean;
}
interface ApprovalRuleEditorProps {
  rule: ApprovalRule;
  onSave: (updatedRule: ApprovalRule) => void;
}

export function ApprovalRuleEditor({ rule, onSave }: ApprovalRuleEditorProps) {
  // Make the component interactive with state
  const [editedRule, setEditedRule] = useState(rule);

  // Update the form when a new rule is selected from the list
  useEffect(() => {
    setEditedRule(rule);
  }, [rule]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditedRule(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setEditedRule(prev => ({ ...prev, isManagerApprovalRequired: checked }));
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            {/* The title is now an editable input */}
            <Input
              id="name"
              value={editedRule.name}
              onChange={handleInputChange}
              className="text-lg font-bold border-0 shadow-none -ml-3 focus-visible:ring-1 focus-visible:ring-ring"
            />
            <CardDescription className="mt-1">
              Configure the conditions and approvers for this workflow.
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" /> Duplicate</Button>
            <Button variant="destructive" size="sm"><Trash className="h-4 w-4 mr-2" /> Delete</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" value={editedRule.description} onChange={handleInputChange} placeholder="A brief description of this rule..." />
        </div>
        <div className="flex items-center space-x-2 p-4 border rounded-lg bg-secondary/50">
          <Checkbox id="managerApproval" checked={editedRule.isManagerApprovalRequired} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="managerApproval" className="font-medium">Require manager approval first</Label>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <Label>Additional Approvers</Label>
             <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-2" />Add</Button>
          </div>
          {/* Improved UI for listing approvers */}
          <div className="p-3 border rounded-lg min-h-[60px] space-x-2 space-y-2">
            {editedRule.approvers.length > 0 ? (
              editedRule.approvers.map(a => (
                <Badge key={a.id} variant="secondary" className="text-base py-1">
                  {a.name}
                  <Button variant="ghost" size="icon" className="h-5 w-5 ml-1"><X className="h-3 w-3"/></Button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-2">No additional approvers.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/50 py-3">
        <Button onClick={() => onSave(editedRule)}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}