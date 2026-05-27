/**
 * 统一 UI 组件导出
 * 基于 shadcn/ui 的基础组件
 */

// 基础组件
export { Button, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Input } from './input';
export { Label } from './label';
export { Textarea } from './textarea';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';
export { Slider } from './slider';

// 布局组件
export { Separator } from './separator';
export { ScrollArea, ScrollBar } from './scroll-area';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

// 反馈组件
export { Alert, AlertDescription, AlertTitle } from './alert';
export { Progress } from './progress';
export { Skeleton } from './skeleton';
export { Badge, badgeVariants } from './badge';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

// 覆盖层组件
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
export { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
export { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';

// 导航组件
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './breadcrumb';

// 表单组件
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './form';

// 数据展示
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './table';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
