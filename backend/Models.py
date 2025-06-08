from torch import nn, cat
from diffusers import UNet2DModel

class ClassConditionedUnet(nn.Module):
	def __init__(self, embedding_num=3, embedding_size=4, simple_size=28):
		super().__init__()

		self.class_emb = nn.Embedding(embedding_num, embedding_size)
		self.embedding_size = embedding_size
		self.num_embedding = embedding_num

		self.model = UNet2DModel(
			sample_size=simple_size,
			in_channels=1 + self.embedding_size,
			out_channels=1,
			layers_per_block=2,
			block_out_channels=(32, 64, 64),
			down_block_types=(
				"DownBlock2D",
				"AttnDownBlock2D",
				"DownBlock2D",
			),
			up_block_types=(
				"UpBlock2D",
				"AttnUpBlock2D",
				"UpBlock2D",
			),
		)
		# Our forward method now takes the class labels as an additional argument

	def forward(self, x, t, conditions):
		bs, ch, w, h = x.shape

		class_cond = self.class_emb(conditions)  # Map to embedding dimension
		b_expanded = x.unsqueeze(-1)  # shape: [20, 1, 28, 28, 1]

		net_input = cat([b_expanded, class_cond], dim=-1)
		net_input = net_input.permute(0, 1, 4, 2, 3)  # [20, 1, 5, 28, 28]
		net_input = net_input.view(bs, 1 + self.embedding_size, w, h)

		return self.model(net_input, t).sample