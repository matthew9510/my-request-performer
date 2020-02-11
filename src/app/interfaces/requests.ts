export interface Requests {
    id: string | number;
    song: string;
    artist: string;
    event_id: string | number;
    memo: string;
    status: "pending" | "accepted" | "complete" | "rejected" | "now playing";
    requester_id: string | number;
    original_request_id: string | number;
    type: "top up" | "original";
    amount: number;
    created_on: string | number;
    created_by: string | number;
    updated_on: string | number;
    updated_by: string | number;
}