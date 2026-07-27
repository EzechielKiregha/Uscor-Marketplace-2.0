import { Injectable } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
    private pusher: Pusher;
    constructor(){
        this.pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID || "2155970",
            key: process.env.PUSHER_KEY || "c17e46fbfce6e014e136",
            secret: process.env.PUSHER_SECRET || "d64776a3841e33ff5376",
            cluster: process.env.PUSHER_CLUSTER || "mt1",
            useTLS: true,
        });
    }

    async trigger(channel: string, event: string, data: any) {
        await this.pusher.trigger(channel, event, data);
    }
}
