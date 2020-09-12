import { EntityUI } from '@/game/entity-ui'
import { Eventor } from '@/lib/zengine'
import { Rooms, RoomType } from '@shared/rooms'
import { html } from 'lighterhtml'

const rooms = [RoomType.Point, RoomType.Honzik, RoomType.Dorm]

export class MoveUI extends EntityUI {
	onClose = new Eventor()

	handleMove(room: RoomType) {
		this.world.get('manager').handleMove(room)
		this.onClose.trigger()
		this.remove()
	}

	render() {
		return html`<div class="prompt move-prompt">
			<div class="content">
				<div class="title">Move to different room</div>
				<div class="content">
					<div class="rooms">
						${rooms
							.map((r) => Rooms[r])
							.map(
								(r) =>
									html`<div
										class="room"
										onclick=${() => this.handleMove(r.type)}
									>
										${r.name}
									</div>`
							)}
					</div>
				</div>
			</div>
		</div>`
	}
}
