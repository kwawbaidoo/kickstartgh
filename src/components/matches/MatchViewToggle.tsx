"use client";

import { LayoutGrid, List } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MatchView = "card" | "list";

type MatchViewToggleProps = {
  value: MatchView;
  onChange: (view: MatchView) => void;
};

function MatchViewToggle({ value, onChange }: MatchViewToggleProps) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as MatchView)}>
      <TabsList>
        <TabsTrigger value="card" aria-label="Card view">
          <LayoutGrid className="size-4" />
        </TabsTrigger>
        <TabsTrigger value="list" aria-label="List view">
          <List className="size-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export { MatchViewToggle };
