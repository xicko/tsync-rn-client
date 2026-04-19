// ============================================
// Socket response types
export interface SocketCommandAck {
  type: 'ack';
  command: string;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface SocketStatusUpdate {
  type: 'status';
  deviceId: string;
  online: boolean;
  timestamp: string;
}

export interface SocketErrorResponse {
  type: 'error';
  code: string;
  message: string;
  timestamp: string;
}

export type SocketResponse =
  | SocketCommandAck
  | SocketStatusUpdate
  | SocketErrorResponse;
// ============================================
export interface TailscaleClientConnectivity {
  endpoints?: string[];
  mappingVariesByDestIP?: boolean;
  latency?: Record<
    string,
    {
      preferred?: boolean;
      latencyMs?: number;
    }
  >;
  clientSupports?: {
    hairPinning?: boolean | null;
    ipv6?: boolean | null;
    pcp?: boolean | null;
    pmp?: boolean | null;
    udp?: boolean | null;
    upnp?: boolean | null;
  };
}

export interface TailscalePostureIdentity {
  serialNumbers?: string[];
  disabled?: boolean;
}

export interface TailscaleDistro {
  name?: string;
  version?: string;
  codeName?: string;
}

export interface TailscaleDevice {
  addresses: string[];
  id: string;
  nodeId: string;
  user: string;
  name: string;
  hostname: string;
  clientVersion: string;
  updateAvailable: boolean;
  os: string;
  created: string;
  connectedToControl: boolean;
  lastSeen?: string;
  keyExpiryDisabled: boolean;
  expires: string;
  authorized: boolean;
  isExternal: boolean;
  multipleConnections?: boolean;
  machineKey: string;
  nodeKey: string;
  blocksIncomingConnections: boolean;
  enabledRoutes: string[];
  advertisedRoutes: string[];
  clientConnectivity?: TailscaleClientConnectivity;
  tags: string[];
  tailnetLockError: string;
  tailnetLockKey: string;
  sshEnabled: boolean;
  postureIdentity?: TailscalePostureIdentity;
  isEphemeral: boolean;
  distro?: TailscaleDistro;

  isHost?: boolean;
  isThisDevice?: boolean;

  adbIdentifier?: string;
  windowsMacAddress?: string;
}

export interface TailscaleDevicesResponse {
  devices: TailscaleDevice[];
}

// ============================================
// FlatList item — extends TailscaleDevice with live state
export interface DeviceListItem extends TailscaleDevice {
  /** True when connectedToControl AND lastSeen within the past 5 minutes */
  isActive: boolean;
  /** Most recent socket message received from this device, if any */
  lastSocketResponse: SocketResponse | null;
}
// ==================================================