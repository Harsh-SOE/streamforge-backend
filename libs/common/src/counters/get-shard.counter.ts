import * as crypto from 'crypto';

export function getShardFor(id: string, shards = 64): number {
  const hash = crypto.createHash('sha256').update(id).digest();
  const num = hash.readInt32BE();
  const shardNum = Math.abs(num) % shards;
  console.log(shardNum);
  return shardNum;
}
