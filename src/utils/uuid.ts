import * as uuidLib from 'node-uuid';

export default function uuid(): string {
    return uuidLib.v4();
}