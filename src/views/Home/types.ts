export interface Tag {
    color: string;
    title: string;
    groupName: string;
}

export interface ChecklistItem {
    key: string;
    value: string;
    tags?: string[];
    archived?: boolean;
}
