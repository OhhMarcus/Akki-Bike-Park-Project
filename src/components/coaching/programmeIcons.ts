import { Bike, CornerUpRight, Flag, MoveUpRight, Smile, Sprout, UserRound, Users, Waves, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { Sprout, Smile, Waves, CornerUpRight, MoveUpRight, Flag, UserRound, Users, Bike };

export const programmeIcon = (name: string): LucideIcon => icons[name] ?? Bike;
