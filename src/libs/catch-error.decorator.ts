import { Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

export function CatchError(errorEventName: string = "unhandled-event-error") {
  const eventEmitterConstructor = Inject(EventEmitter2);

  return (target: any, _: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    eventEmitterConstructor(target, "eventEmitter");

    descriptor.value = async function (...args: any[]) {
      const eventEmitter = (this as any).eventEmitter as EventEmitter2;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        eventEmitter.emit(errorEventName, error);
      }
    };

    const metadataKeys = Reflect.getMetadataKeys(originalMethod);

    metadataKeys.forEach((key) => {
      const metadata = Reflect.getMetadata(key, originalMethod);
      Reflect.defineMetadata(key, metadata, descriptor.value);
    });

    return descriptor;
  };
}
