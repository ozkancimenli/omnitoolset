/**
 * Collaboration Types
 * @module types/collaboration
 */

/**
 * Collaboration user
 */
export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    x: number;
    y: number;
    page: number;
  };
  selection?: {
    start: number;
    end: number;
    page: number;
  };
}

/**
 * Collaboration event
 */
export interface CollaborationEvent {
  type:
    | 'annotation_add'
    | 'annotation_update'
    | 'annotation_delete'
    | 'cursor_move'
    | 'selection_change'
    | 'user_join'
    | 'user_leave';
  userId: string;
  timestamp: number;
  data: any;
}

/**
 * Collaboration room
 */
export interface CollaborationRoom {
  id: string;
  name: string;
  users: CollaborationUser[];
  createdAt: number;
  updatedAt: number;
}

