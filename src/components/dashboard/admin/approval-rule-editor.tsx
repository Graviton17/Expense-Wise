import { FC, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Users } from "lucide-react";

interface ApprovalRule {
  id: string;
  condition: "AMOUNT_THRESHOLD" | "CATEGORY" | "USER_ROLE";
  value: string | number;
  approverRole: "MANAGER" | "ADMIN";
  isRequired: boolean;
  order: number;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  rules: ApprovalRule[];
  isManagerApprover: boolean;
  approversSequence: boolean;
  minimumApprovalPercentage: number;
  isActive: boolean;
}

interface ApprovalRuleEditorProps {
  workflow?: ApprovalWorkflow;
  onSave?: (workflow: ApprovalWorkflow) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ApprovalRuleEditor: FC<ApprovalRuleEditorProps> = ({
  workflow,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [workflowData, setWorkflowData] = useState<ApprovalWorkflow>(
    workflow || {
      id: "",
      name: "",
      rules: [],
      isManagerApprover: false,
      approversSequence: false,
      minimumApprovalPercentage: 50,
      isActive: true,
    }
  );

  const addRule = () => {
    const newRule: ApprovalRule = {
      id: Math.random().toString(36).substr(2, 9),
      condition: "AMOUNT_THRESHOLD",
      value: 0,
      approverRole: "MANAGER",
      isRequired: true,
      order: workflowData.rules.length + 1,
    };

    setWorkflowData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));
  };

  const removeRule = (ruleId: string) => {
    setWorkflowData((prev) => ({
      ...prev,
      rules: prev.rules.filter((rule) => rule.id !== ruleId),
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<ApprovalRule>) => {
    setWorkflowData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    }));
  };

  const handleSave = () => {
    onSave?.(workflowData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Approval Rule Configuration</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure approval workflows and rules for expense processing
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Workflow Name */}
        <div className="space-y-2">
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={workflowData.name}
            onChange={(e) =>
              setWorkflowData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter workflow name"
            disabled={isLoading}
          />
        </div>

        {/* Manager Approver Setting */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="manager-approver"
            checked={workflowData.isManagerApprover}
            onCheckedChange={(checked) =>
              setWorkflowData((prev) => ({
                ...prev,
                isManagerApprover: !!checked,
              }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="manager-approver" className="text-sm font-medium">
            Is manager an approver?
          </Label>
        </div>

        {/* Approvers Sequence Setting */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="approvers-sequence"
            checked={workflowData.approversSequence}
            onCheckedChange={(checked) =>
              setWorkflowData((prev) => ({
                ...prev,
                approversSequence: !!checked,
              }))
            }
            disabled={isLoading}
          />
          <Label htmlFor="approvers-sequence" className="text-sm font-medium">
            Approvers Sequence
          </Label>
        </div>

        {/* Minimum Approval Percentage */}
        <div className="space-y-2">
          <Label htmlFor="approval-percentage">
            Minimum Approval percentage (
            {workflowData.minimumApprovalPercentage}%)
          </Label>
          <Input
            id="approval-percentage"
            type="range"
            min="1"
            max="100"
            value={workflowData.minimumApprovalPercentage}
            onChange={(e) =>
              setWorkflowData((prev) => ({
                ...prev,
                minimumApprovalPercentage: parseInt(e.target.value),
              }))
            }
            disabled={isLoading}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <Separator />

        {/* Approval Rules */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Approval Rules</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={addRule}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Rule</span>
            </Button>
          </div>

          {workflowData.rules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No approval rules configured</p>
              <p className="text-xs">Add rules to define approval criteria</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workflowData.rules.map((rule, index) => (
                <Card key={rule.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                      <Label className="text-xs">Condition</Label>
                      <Select
                        value={rule.condition}
                        onValueChange={(value: ApprovalRule["condition"]) =>
                          updateRule(rule.id, { condition: value })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AMOUNT_THRESHOLD">
                            Amount Threshold
                          </SelectItem>
                          <SelectItem value="CATEGORY">Category</SelectItem>
                          <SelectItem value="USER_ROLE">User Role</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Value</Label>
                      {rule.condition === "AMOUNT_THRESHOLD" ? (
                        <Input
                          type="number"
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(rule.id, {
                              value: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="Amount"
                          disabled={isLoading}
                        />
                      ) : (
                        <Input
                          value={rule.value}
                          onChange={(e) =>
                            updateRule(rule.id, { value: e.target.value })
                          }
                          placeholder="Value"
                          disabled={isLoading}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Approver Role</Label>
                      <Select
                        value={rule.approverRole}
                        onValueChange={(value: ApprovalRule["approverRole"]) =>
                          updateRule(rule.id, { approverRole: value })
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={rule.isRequired}
                          onCheckedChange={(checked) =>
                            updateRule(rule.id, { isRequired: !!checked })
                          }
                          disabled={isLoading}
                        />
                        <Label className="text-xs">Required</Label>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeRule(rule.id)}
                        disabled={isLoading}
                        className="p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="secondary">Rule {index + 1}</Badge>
                    <Badge variant={rule.isRequired ? "default" : "outline"}>
                      {rule.isRequired ? "Required" : "Optional"}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !workflowData.name.trim()}
          >
            {isLoading ? "Saving..." : "Save Workflow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalRuleEditor;
export type { ApprovalWorkflow, ApprovalRule };
