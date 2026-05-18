import { Injectable } from '@nestjs/common';
import Pusher from 'pusher';

@Injectable()
export class PusherService {
    private pusher: Pusher;
    constructor(){
        this.pusher = new Pusher({
            appId: "2155970",
            key: "c17e46fbfce6e014e136",
            secret: "d64776a3841e33ff5376",
            cluster: "mt1",
            useTLS: true
            });
    }

    async trigger(channel: string, event: string, data: any) {
        await this.pusher.trigger(channel, event, data);
    }
}
