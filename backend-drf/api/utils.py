import os
from django.conf import settings
import matplotlib.pyplot as plt


def save_plot(plot_img_path):
    image_path = os.path.join(settings.MEDIA_ROOT, plot_img_path)
    plt.savefig(image_path)
    plt.close()
    image_url = settings.MEDIA_URL + plot_img_path
    return image_url


def plot_line_chart(series_list, labels, title, xlabel, ylabel, filename):
    """
    series_list: lista de listas/Series a graficar.
    labels: lista de etiquetas para cada serie.
    title, xlabel, ylabel: etiquetas de la gráfica.
    filename: nombre del archivo a guardar (ej. 'AAPL_plot.png')
    """
    plt.switch_backend('AGG')
    plt.figure(figsize=(12, 5))
    
    for i, series in enumerate(series_list):
        if isinstance(series, dict):
            plt.plot(series["data"], label=series["label"], color=series.get("color"))
        else:
            plt.plot(series, label=labels[i])
    
    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.legend()
    return save_plot(filename)
