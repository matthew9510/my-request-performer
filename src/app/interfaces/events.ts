export interface Event {
    title: string,
    description: string,
    cover_fee: number, 
    genre: string,
    url: string,
    image_id: string,

    event_date: Date,
    event_start_time: Date, 
    event_end_time: Date, 

    performer_id:string
    venue_id: string 
}

// in backend should we need to hard code this 
//   "status": "Lit",