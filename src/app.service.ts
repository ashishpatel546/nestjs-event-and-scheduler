import { Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/user-created.event';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';

export interface User {
  id: string;
  email: string;
  password: string;
}
const users: User[] = [];

@Injectable()
export class AppService {
  constructor(
    private readonly evenEmitter: EventEmitter2,
    private readonly scheduleReg: SchedulerRegistry,
  ) {}

  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(body: CreateUserDto) {
    const userId = Date.now().toString();
    const userEvent = new UserCreatedEvent(userId, body.email);
    const user: User = {
      id: userId,
      email: body.email,
      password: body.password,
    };
    users.push(user);
    this.logger.log('Creating new User...', user);
    this.evenEmitter.emit('user_created', userEvent);
    const establishedTimeout = setTimeout(
      () => this.establishWebSocketConnection(userId),
      7000,
    );
    this.scheduleReg.addTimeout(`${userId}_ws`, establishedTimeout);
    return user;
  }

  private establishWebSocketConnection(userId: string) {
    this.logger.log(`Establising web socket connection for ${userId}`);
  }

  @OnEvent('user_created')
  welcomeNewUser(payload: UserCreatedEvent) {
    this.logger.log(`Welcoming new user...`, payload.email);
  }

  @OnEvent('user_created', { async: true })
  async sendWelcomeGift(payload: UserCreatedEvent) {
    this.logger.log(`Sending welcome gift to: ${payload.email}`);
    await new Promise<void>((res) =>
      setTimeout(() => {
        res();
      }, 5000),
    );
    this.logger.log(`Welcome gift sent to ${payload.email}`);
  }

  async getAllUsers() {
    return users;
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  deleteExpiredUser() {
    this.logger.log('deleting expired users');
  }
}
