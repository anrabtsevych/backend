import { Telegram } from 'src/telegram/telegram.interface';

export const getTelegramConfig = (): Telegram => {
	//https://api.telegram.org/bot<token>:/getUpdates
	return {
		chatId: '7835043425',
		token: '7835043425-AAFZ9R52bCmF9HzT7L7SDcE6BEynuUuomS0',
	};
};
