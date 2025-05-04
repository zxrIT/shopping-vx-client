export const ADDRESS_TOPIC = {
  '1': '家',
  '2': '公司',
  '3': '学校'
} as const;

export type AddressTopicKey = keyof typeof ADDRESS_TOPIC;
export type AddressTopicValue = typeof ADDRESS_TOPIC[AddressTopicKey]; 