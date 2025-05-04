import {ResponseData} from '../../../typings/response/responseData'
import { User } from '../../../typings/response/user/user';
import { requestFunction } from "../../utils/request";

interface IMessage {
	role: number  // 0: user, 1: ai
	message: string
	showMessage?: string // 用于打字机效果显示的文字
	isTyping?: boolean // 是否正在打字
}

Page({
	data: {
		userInfo: {} as User,
		messageList: [
			{
				role: 1,
				message: "您好，智能机器人小李在这里恭候您，请问有什么可以帮您？",
				showMessage: "您好，智能机器人小李在这里恭候您，请问有什么可以帮您？",
				isTyping: false
			}
		] as IMessage[],
		inputValue: '',
		scrollToView: '',
		typingTimer: null as any,
	},

	onShow() {
		const userInfo = wx.getStorageSync('userObject');
		if (userInfo) {
			this.setData({
				userInfo:userInfo
			});
		}
	},

	// 输入框内容变化
	onInput(e: WechatMiniprogram.Input) {
		this.setData({
			inputValue: e.detail.value
		});
	},

	// 打字机效果
	typeMessage(messageIndex: number, fullMessage: string) {
		let currentIndex = 0;
		const messageLength = fullMessage.length;
		const typingSpeed = 50; // 打字速度(ms)

		const typeChar = () => {
			if (currentIndex <= messageLength) {
				const showMessage = fullMessage.slice(0, currentIndex);
				const messageList = this.data.messageList;
				messageList[messageIndex].showMessage = showMessage;
				messageList[messageIndex].isTyping = currentIndex < messageLength;

				this.setData({
					messageList,
					scrollToView: `msg-${messageIndex}`
				});

				currentIndex++;
				this.data.typingTimer = setTimeout(typeChar, typingSpeed);
			}
		};

		typeChar();
	},

	// 发送消息
	sendMessage() {
		const { inputValue, messageList } = this.data;
		if (!inputValue.trim()) return;

		// 清除之前的打字效果定时器
		if (this.data.typingTimer) {
			clearTimeout(this.data.typingTimer);
		}

		// 添加用户消息
		const newList = [...messageList, {
			role: 0,
			message: inputValue,
			showMessage: inputValue,
			isTyping: false
		}];

		this.setData({
			messageList: newList,
			inputValue: '',
			scrollToView: `msg-${newList.length - 1}`
		});

		// 回复
		setTimeout(async () => {
			requestFunction<ResponseData<string>>({
				url: "http://localhost:8080/ai/deepSeek/R1",
				method: "POST",
				data: {
					model: "",
					prompt: inputValue
				}
			}).then((response) => {
				console.log(response.code)
				if (response.code === 200) {
					console.log(response.data)
					const aiReply = {
						role: 1,
						message: response.data,
						showMessage: response.data,
						isTyping: true
					};
					const finalList = [...newList, aiReply];
					this.setData({
						messageList: finalList,
						scrollToView: `msg-${finalList.length - 1}`
					}, () => {
						this.typeMessage(finalList.length - 1, response.data);
					});
				}
			})
		}, 0);
	},

	// 拨打电话
	mobile() {
		wx.showActionSheet({
			itemList: ['拨打客服电话15028392180'],
			success: (res) => {
				if (res.tapIndex === 0) {
					wx.makePhoneCall({
						phoneNumber: '15028392180'
					});
				}
			}
		});
	},

	onUnload() {
		// 页面卸载时清除定时器
		if (this.data.typingTimer) {
			clearTimeout(this.data.typingTimer);
		}
	}
}); 